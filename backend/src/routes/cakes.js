const express = require("express");
const router = express.Router();
const Cake = require("../models/Cake");
const cloudinary = require("../config/cloudinary");
const { uploadCakeImages } = require("../middleware/upload");

// Multer middleware: up to 10 images under field "images"
const uploadMiddleware = uploadCakeImages.array("images", 10);

// ── GET /api/cakes ── list all (with optional filters)
router.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === "true") query.featured = true;
    if (req.query.inStock === "true") query.inStock = true;

    const sort = {};
    if (req.query.sort === "price_asc") sort.price = 1;
    else if (req.query.sort === "price_desc") sort.price = -1;
    else sort.createdAt = -1;

    const cakes = await Cake.find(query).sort(sort);
    res.json({ success: true, count: cakes.length, data: cakes });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/cakes/:id ── single cake
router.get("/:id", async (req, res, next) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ success: false, message: "Cake not found" });
    res.json({ success: true, data: cake });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cakes ── create with optional multi-image upload
router.post("/", uploadMiddleware, async (req, res, next) => {
  try {
    const { name, price, category, description, flavors, sizes, featured, inStock } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: "Cake name is required" });
    if (!price || isNaN(Number(price)))
      return res.status(400).json({ success: false, message: "Valid price is required" });
    if (!category)
      return res.status(400).json({ success: false, message: "Category is required" });

    const cakeData = {
      name: name.trim(),
      price: Number(price),
      category,
      description: description || "",
      flavors: parseFlatList(flavors),
      sizes: parseFlatList(sizes),
      featured: featured === "true" || featured === true,
      inStock: inStock === undefined || inStock === "true" || inStock === true,
    };

    // req.files is an array from .array(); each file has .path (url) and .filename (publicId)
    if (req.files && req.files.length > 0) {
      cakeData.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      // Also populate the legacy image field with the first image for backward compat
      cakeData.image = { url: req.files[0].path, publicId: req.files[0].filename };
    }

    const cake = await Cake.create(cakeData);
    res.status(201).json({ success: true, data: cake });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/cakes/:id ── update (images optional)
router.put("/:id", uploadMiddleware, async (req, res, next) => {
  try {
    const existing = await Cake.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Cake not found" });

    const { name, price, category, description, flavors, sizes, featured, inStock, removeImageIds } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (flavors !== undefined) updates.flavors = parseFlatList(flavors);
    if (sizes !== undefined) updates.sizes = parseFlatList(sizes);
    if (featured !== undefined) updates.featured = featured === "true" || featured === true;
    if (inStock !== undefined) updates.inStock = inStock === "true" || inStock === true;

    // Build the updated images list:
    // 1. Start from existing images
    let currentImages = existing.images ? [...existing.images] : [];

    // 2. Remove images whose publicIds were sent in `removeImageIds`
    const toRemove = parseFlatList(removeImageIds);
    if (toRemove.length > 0) {
      // Delete removed images from Cloudinary
      await Promise.all(
        toRemove.map((pid) => cloudinary.uploader.destroy(pid).catch(() => {}))
      );
      currentImages = currentImages.filter((img) => !toRemove.includes(img.publicId));
    }

    // 3. Append newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      currentImages = [...currentImages, ...newImages];
    }

    if (toRemove.length > 0 || (req.files && req.files.length > 0)) {
      updates.images = currentImages;
      // Keep legacy image field in sync with first image
      if (currentImages.length > 0) {
        updates.image = { url: currentImages[0].url, publicId: currentImages[0].publicId };
      } else {
        updates.image = { url: "", publicId: "" };
      }
    }

    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: cake });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cakes/:id ── delete cake + all its Cloudinary images
router.delete("/:id", async (req, res, next) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ success: false, message: "Cake not found" });

    // Delete all images from Cloudinary
    const allPublicIds = [
      ...(cake.images ?? []).map((i) => i.publicId),
      // Also delete legacy image if it has a different publicId
      ...(cake.image?.publicId && !(cake.images ?? []).find((i) => i.publicId === cake.image.publicId)
        ? [cake.image.publicId]
        : []),
    ].filter(Boolean);

    await Promise.all(allPublicIds.map((pid) => cloudinary.uploader.destroy(pid).catch(() => {})));

    await cake.deleteOne();
    res.json({ success: true, message: "Cake deleted" });
  } catch (err) {
    next(err);
  }
});

// ── Helper ─────────────────────────────────────────────────────────────────
function parseFlatList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
}

module.exports = router;
