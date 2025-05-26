/* eslint-disable react/prop-types */
import { Menu, MenuItem } from "@headlessui/react";
import { MoreVertical } from "lucide-react";

export default function DropdownMenu({ items }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button asChild>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical size={18} className="text-gray-500" />
        </button>
      </Menu.Button>

      <Menu.Items
        as="div"
        className="absolute right-0 z-10 mt-1 w-36 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none"
      >
        {items.map((item, idx) => (
          <div className="px-1 py-1" key={idx}>
            <MenuItem as="button" onClick={item.onClick}>
              {({ active }) => (
                <div
                  className={`${
                    active
                      ? item.style === "danger"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-900"
                      : item.style === "danger"
                      ? "text-red-500"
                      : "text-gray-700"
                  } group flex w-full items-center rounded px-2 py-1 text-sm`}
                >
                  {item.icon && <item.icon size={16} className="mr-2" />}
                  {item.label}
                </div>
              )}
            </MenuItem>
          </div>
        ))}
      </Menu.Items>
    </Menu>
  );
}