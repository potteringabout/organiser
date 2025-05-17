import { Menu } from "@headlessui/react";
import { MoreVertical, Trash2 } from "lucide-react";

export default function DropdownMenu({ onDelete }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-1 hover:bg-gray-100 rounded">
        <MoreVertical size={18} className="text-gray-500" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onDelete}
                className={`${
                  active ? "bg-red-50 text-red-600" : "text-red-500"
                } group flex w-full items-center rounded px-2 py-1 text-sm`}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}