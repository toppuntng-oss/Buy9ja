import { Plus } from "lucide-react";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  onAddToCart: () => void;
}

export function MenuItem({
  name,
  description,
  price,
  image,
  onAddToCart,
}: MenuItemProps) {
  return (
    <div className="bg-white rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{name}</h4>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <p className="font-semibold text-lg">${price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={onAddToCart}
          className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
