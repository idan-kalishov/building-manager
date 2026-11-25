import { useEffect, useMemo, useState } from "react";
import { subscribeBuildings } from "../lib/buildings.service";
import { useBuildingsStore } from "../store/buildingsStore";

interface BuildingAddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BuildingAddressInput({
  value,
  onChange,
}: BuildingAddressInputProps) {
  const buildings = useBuildingsStore((state) => state.buildings);
  const setBuildings = useBuildingsStore((state) => state.setBuildings);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => subscribeBuildings(setBuildings), [setBuildings]);

  const addresses = useMemo(
    () =>
      [...new Set(buildings.map((building) => building.address).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "he")),
    [buildings],
  );
  const filteredAddresses = useMemo(() => {
    const query = value.trim().toLocaleLowerCase("he");
    if (!query) return addresses;
    return addresses.filter((address) =>
      address.toLocaleLowerCase("he").includes(query),
    );
  }, [addresses, value]);

  const selectAddress = (address: string) => {
    onChange(address);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="task-building-address-list"
        aria-activedescendant={
          isOpen && filteredAddresses.length
            ? `task-building-address-option-${activeIndex}`
            : undefined
        }
        value={value}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
          if (event.key === "ArrowDown" && filteredAddresses.length) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) =>
              Math.min(index + 1, filteredAddresses.length - 1),
            );
          }
          if (event.key === "ArrowUp" && filteredAddresses.length) {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Enter" && isOpen && filteredAddresses.length) {
            event.preventDefault();
            selectAddress(filteredAddresses[activeIndex]);
          }
        }}
        placeholder="הקלד או בחר כתובת בניין..."
        className="w-full border rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {isOpen && (
        <div
          id="task-building-address-list"
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {filteredAddresses.length ? (
            filteredAddresses.map((address, index) => (
              <button
                id={`task-building-address-option-${index}`}
                key={address}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectAddress(address)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right text-base transition-colors ${
                  index === activeIndex
                    ? "bg-blue-50 text-blue-800"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg">
                  🏢
                </span>
                <span className="font-medium">{address}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-base text-gray-500">
              לא נמצאו בניינים מתאימים
            </p>
          )}
        </div>
      )}
    </div>
  );
}
