import React from "react";

const DrinkCard = ({ drink }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-4 flex flex-col items-center">
      <img
        src={drink.imageUrl}
        alt={drink.name}
        className="w-full h-48 object-cover rounded-xl"
      />
      <h2 className="text-lg font-bold mt-2">{drink.name}</h2>
    </div>
  );
};

export default DrinkCard;
