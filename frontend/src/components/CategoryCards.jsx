import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Electronics",
    description: "Gadgets & Tech",
    icon: "💻",
    color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    link: "/marketplace?category=electronics"
  },
  {
    id: 2,
    name: "Books",
    description: "Knowledge Hub",
    icon: "📚",
    color: "bg-gradient-to-r from-violet-500 to-purple-500",
    link: "/marketplace?category=books"
  },
  {
    id: 3,
    name: "Electrical",
    description: "Power & Equipment",
    icon: "⚡",
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
    link: "/marketplace?category=electrical"
  },
  {
    id: 4,
    name: "Vehicles",
    description: "Cars & Transport",
    icon: "🚗",
    color: "bg-gradient-to-r from-emerald-500 to-teal-500",
    link: "/marketplace?category=vehicles"
  },
  {
    id: 5,
    name: "Miscellaneous",
    description: "Everything Else",
    icon: "🎯",
    color: "bg-gradient-to-r from-pink-500 to-rose-500",
    link: "/marketplace?category=miscellaneous"
  }
];

export default function CategoryCards() {
  return (
    <div className="py-16 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-base-content">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group block"
            >
              <div className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className={`${category.color} rounded-lg aspect-square flex flex-col justify-center items-center text-white shadow-lg hover:shadow-xl transform transition-all duration-300 border-2 border-white/10`}>
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl mb-3 transform transition-transform group-hover:scale-110 duration-300">{category.icon}</span>
                    <h3 className="text-lg font-bold mb-1 tracking-wide">{category.name}</h3>
                    <p className="text-xs text-white/90 font-medium">{category.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 