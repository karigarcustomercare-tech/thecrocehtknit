import cake1 from "@/assets/cake-1.jpg";
import cake2 from "@/assets/cake-2.jpg";
import cake3 from "@/assets/cake-3.jpg";
import cake4 from "@/assets/cake-4.jpg";
import cake5 from "@/assets/cake-5.jpg";
import cake6 from "@/assets/cake-6.jpg";
import cake7 from "@/assets/cake-7.jpg";
import cake8 from "@/assets/cake-8.jpg";
import cake9 from "@/assets/cake-9.jpg";
import cake10 from "@/assets/cake-10.jpg";
import cake11 from "@/assets/cake-11.jpg";
import cake12 from "@/assets/cake-12.jpg";

export type Category = "Birthday" | "Anniversary" | "Theme" | "Cupcakes" | "Desserts";

export interface Cake {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  flavors: string[];
  sizes: string[];
}

export const cakes: Cake[] = [
  { id: "c1", name: "Velvet Bliss", price: 899, category: "Anniversary", image: cake1,
    description: "Classic red velvet layered with silky cream cheese frosting.",
    flavors: ["Red Velvet", "Vanilla", "Chocolate"], sizes: ["0.5 kg", "1 kg", "1.5 kg"] },
  { id: "c2", name: "Unicorn Dream", price: 1299, category: "Theme", image: cake2,
    description: "Pastel rosette theme cake for pure magic — kids adore it.",
    flavors: ["Vanilla", "Strawberry", "Rainbow"], sizes: ["1 kg", "1.5 kg", "2 kg"] },
  { id: "c3", name: "Cocoa Cascade", price: 1099, category: "Birthday", image: cake3,
    description: "Belgian chocolate truffle with dark ganache drip.",
    flavors: ["Chocolate", "Dark Truffle", "Nutella"], sizes: ["0.5 kg", "1 kg", "2 kg"] },
  { id: "c4", name: "Pearl & Petals", price: 2499, category: "Anniversary", image: cake4,
    description: "Two-tier fondant with hand-crafted sugar roses.",
    flavors: ["Vanilla", "Butterscotch", "Pineapple"], sizes: ["2 kg", "3 kg"] },
  { id: "c5", name: "Golden Butterscotch", price: 949, category: "Birthday", image: cake5,
    description: "Toasted butterscotch praline with warm caramel drizzle.",
    flavors: ["Butterscotch", "Caramel"], sizes: ["0.5 kg", "1 kg", "1.5 kg"] },
  { id: "c6", name: "Cupcake Confetti", price: 599, category: "Cupcakes", image: cake6,
    description: "Box of six buttercream cupcakes in bakery-fresh flavors.",
    flavors: ["Vanilla", "Chocolate", "Red Velvet"], sizes: ["Box of 6", "Box of 12"] },
  { id: "c7", name: "Strawberry Cloud", price: 799, category: "Birthday", image: cake7,
    description: "Airy sponge, whipped cream and juicy fresh strawberries.",
    flavors: ["Strawberry", "Vanilla"], sizes: ["0.5 kg", "1 kg"] },
  { id: "c8", name: "Number One", price: 1199, category: "Theme", image: cake8,
    description: "Number-shaped celebration cake, personalised for the day.",
    flavors: ["Vanilla", "Chocolate", "Red Velvet"], sizes: ["1 kg", "1.5 kg"] },
  { id: "c9", name: "Macaron Medley", price: 499, category: "Desserts", image: cake9,
    description: "Pastel French macarons — crisp shells, silky ganache.",
    flavors: ["Rose", "Pistachio", "Caramel"], sizes: ["Box of 6", "Box of 12"] },
  { id: "c10", name: "Blueberry Cheesecake", price: 849, category: "Desserts", image: cake10,
    description: "Creamy no-bake cheesecake crowned with wild blueberries.",
    flavors: ["Blueberry", "Classic"], sizes: ["0.5 kg", "1 kg"] },
  { id: "c11", name: "Heart of Roses", price: 1099, category: "Anniversary", image: cake11,
    description: "Heart-shaped red velvet with rose petal accents.",
    flavors: ["Red Velvet", "Chocolate"], sizes: ["1 kg", "1.5 kg"] },
  { id: "c12", name: "Tiramisu Jar", price: 299, category: "Desserts", image: cake12,
    description: "Espresso-soaked layers with mascarpone in a glass jar.",
    flavors: ["Classic Coffee"], sizes: ["Single", "Set of 4"] },
];

export const categories: (Category | "All")[] = ["All", "Birthday", "Anniversary", "Theme", "Cupcakes", "Desserts"];
