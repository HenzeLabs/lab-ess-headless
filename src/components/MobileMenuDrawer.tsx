"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "@/lib/types";

type MobileMenuDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  collections?: MenuItem[];
};

const menuCollections = [
  { handle: "mattresses", title: "Mattresses" },
  { handle: "sofa-beds", title: "Sofa Beds" },
  {
    handle: "sofas",
    title: "Sofas",
    subcollections: [
      { handle: "sofas-couches", title: "Sofas" },
      { handle: "sofa-beds", title: "Sofa Beds" },
      { handle: "chaise-sofas", title: "Chaise Sofas" },
      { handle: "corner-sofas", title: "Corner Sofas" },
      { handle: "modular-sofas", title: "Modular Sofas" },
      { handle: "ottomans", title: "Ottomans" },
      { handle: "armchairs", title: "Armchairs" },
      { handle: "sofa-covers", title: "Sofa Covers" },
      { handle: "sofa-modules", title: "Sofa Modules" },
    ],
  },
  {
    handle: "bedroom",
    title: "Bedroom",
    subcollections: [
      { handle: "mattresses", title: "Mattresses" },
      { handle: "bed-bases", title: "Bed Bases" },
      { handle: "bundles-bedroom", title: "Bundles" },
      { handle: "pillows", title: "Pillows" },
      { handle: "kids", title: "Kids" },
      { handle: "bedside-tables", title: "Bedside Tables" },
      { handle: "bedding", title: "Bed Covers & Sheets" },
      { handle: "rugs", title: "Rugs" },
      { handle: "mattress-protectors", title: "Mattress Protectors" },
      { handle: "duvets", title: "Duvets" },
      { handle: "clearance-bedroom", title: "Bedroom Clearance" },
    ],
  },
  {
    handle: "living-room",
    title: "Living Room",
    subcollections: [
      { handle: "sofa-beds", title: "Sofa Beds" },
      { handle: "sofas-couches", title: "Sofas" },
      { handle: "ottomans", title: "Ottomans" },
      { handle: "bookshelves", title: "Bookshelves" },
      { handle: "coffee-side-tables", title: "Coffee & Side Tables" },
      { handle: "rugs", title: "Rugs" },
      { handle: "armchairs", title: "Armchairs" },
      { handle: "homewares", title: "Homewares" },
      { handle: "sofa-covers", title: "Sofa Covers" },
      { handle: "clearance-living", title: "Living Room Clearance" },
    ],
  },
  {
    handle: "outdoor",
    title: "Outdoor",
    subcollections: [
      { handle: "outdoor-lounge-set", title: "Outdoor Lounge Sets" },
      { handle: "outdoor-dining-sets", title: "Outdoor Dining Sets" },
      { handle: "outdoor-lounge-chairs", title: "Outdoor Lounge Chairs" },
      { handle: "outdoor-coffee-tables", title: "Outdoor Coffee Tables" },
      { handle: "outdoor-dining-tables", title: "Outdoor Dining Tables" },
      { handle: "outdoor-dining-seats", title: "Outdoor Dining Seating" },
    ],
  },
  { handle: "clearance", title: "Clearance" },
];

export default function MobileMenuDrawer({
  isOpen,
  onClose,
}: MobileMenuDrawerProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSubmenu = (handle: string) => {
    setExpandedMenu(expandedMenu === handle ? null : handle);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <svg
            className="h-8 w-auto text-green-600"
            viewBox="0 0 787 228"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M231.647 81.5001C271.762 81.5001 304.421 114.964 304.421 154.355C304.421 194.443 271.762 227.907 231.647 227.907C191.532 227.907 158.872 194.443 158.872 154.355C158.872 114.964 191.532 81.5001 231.647 81.5001ZM391.362 81.5001C406.836 81.5001 421.069 87.7102 432.264 97.9234V89.2444C432.264 88.1149 432.72 87.0319 433.534 86.2333C434.347 85.4347 435.452 84.9859 436.601 84.9857H467.768C468.917 84.9859 470.019 85.4347 470.833 86.2333C471.647 87.0319 472.105 88.1149 472.105 89.2444V220.163C472.105 221.292 471.647 222.375 470.833 223.174C470.019 223.973 468.917 224.421 467.768 224.421H433.999C433.539 224.421 433.098 224.242 432.772 223.922C432.447 223.603 432.264 223.17 432.264 222.718V220.397C432.264 219.614 432.041 218.846 431.626 218.178C431.21 217.511 430.614 216.969 429.903 216.612C429.194 216.255 428.398 216.097 427.602 216.156C426.808 216.215 426.044 216.488 425.398 216.946C415.5 224.01 403.596 227.844 391.362 227.907C355.427 227.907 326.173 194.443 326.173 154.355C326.173 114.964 355.427 81.5001 391.362 81.5001ZM650.052 81.5001C665.527 81.5001 679.76 87.7102 690.955 97.9234V89.2444C690.955 88.1149 691.413 87.0319 692.227 86.2333C693.038 85.4347 694.143 84.9857 695.292 84.9857H726.459C727.608 84.9859 728.712 85.4347 729.526 86.2333C730.337 87.0319 730.796 88.1149 730.796 89.2444V220.163C730.796 221.292 730.337 222.375 729.526 223.174C728.712 223.973 727.608 224.421 726.459 224.421H692.69C692.229 224.421 691.789 224.242 691.463 223.922C691.138 223.603 690.955 223.17 690.955 222.718V220.397C690.955 219.614 690.735 218.846 690.316 218.178C689.901 217.511 689.305 216.969 688.596 216.612C687.885 216.255 687.089 216.097 686.295 216.156C685.499 216.215 684.735 216.488 684.089 216.946C674.193 224.01 662.287 227.844 650.052 227.907C614.118 227.907 584.864 194.443 584.864 154.355C584.864 114.964 614.118 81.5001 650.052 81.5001ZM770.141 191.254C774.768 191.254 778.724 192.897 782.012 196.183C785.3 199.439 786.945 203.379 786.945 208.004C786.945 212.628 785.3 216.583 782.012 219.87C778.724 223.125 774.768 224.753 770.141 224.753C765.543 224.753 761.6 223.11 758.312 219.824C755.054 216.538 753.427 212.598 753.427 208.004C753.427 203.409 755.054 199.469 758.312 196.183C761.6 192.897 765.543 191.254 770.141 191.254ZM550.795 0.000488818C551.947 0.000493486 553.048 0.449333 553.862 1.24795C554.676 2.04656 555.132 3.12968 555.132 4.25907V220.165C555.132 221.294 554.676 222.378 553.862 223.176C553.048 223.975 551.947 224.424 550.795 224.424H516.16C515.008 224.424 513.906 223.975 513.092 223.176C512.279 222.378 511.823 221.294 511.823 220.165V4.25907C511.823 3.12968 512.279 2.04656 513.092 1.24795C513.906 0.449328 515.008 0.000488818 516.16 0.000488818H550.795ZM39.3282 1.96223e-10C39.8976 -5.36663e-06 40.4618 0.110079 40.9878 0.324085C41.5142 0.538085 41.9919 0.851822 42.3948 1.24722C42.7975 1.64266 43.117 2.11219 43.3348 2.62886C43.5529 3.14547 43.6651 3.69916 43.6651 4.25832V137.973L95.5002 86.2586C95.9036 85.8561 96.3848 85.5363 96.9154 85.3178C97.446 85.0996 98.0157 84.9872 98.5908 84.9872H139.418C140.276 84.9872 141.115 85.2372 141.828 85.7052C142.542 86.1735 143.098 86.839 143.426 87.6176C143.754 88.3959 143.839 89.2526 143.671 90.0788C143.504 90.9049 143.09 91.6638 142.483 92.2592L85.5551 148.082L151.213 217.261C151.789 217.868 152.172 218.626 152.315 219.444C152.458 220.262 152.354 221.102 152.017 221.863C151.681 222.624 151.125 223.271 150.418 223.726C149.712 224.181 148.885 224.423 148.041 224.423H104.216C103.599 224.423 102.989 224.294 102.427 224.044C101.865 223.794 101.364 223.429 100.957 222.974L62.9047 180.409C61.4313 178.761 59.4812 177.593 57.3148 177.061C55.1481 176.529 52.8677 176.658 50.7776 177.431C48.6878 178.204 46.8875 179.584 45.6167 181.388C44.3459 183.191 43.6651 185.332 43.6651 187.525V220.164C43.6651 220.724 43.5529 221.277 43.3348 221.794C43.117 222.311 42.7975 222.78 42.3948 223.175C41.9919 223.571 41.5142 223.885 40.9878 224.099C40.4618 224.313 39.8976 224.423 39.3282 224.423H4.33696C3.76743 224.423 3.20329 224.313 2.6771 224.099C2.15095 223.885 1.67303 223.571 1.27033 223.175C0.867631 222.78 0.54806 222.311 0.330114 221.794C0.112171 221.277 -2.07432e-07 220.724 0 220.164V4.25832C1.42215e-05 3.69916 0.112202 3.14547 0.330114 2.62886C0.548065 2.11219 0.867613 1.64266 1.27033 1.24722C1.67304 0.851791 2.15119 0.538088 2.67735 0.324085C3.20349 0.110104 3.76748 -5.36631e-06 4.33696 1.96217e-10L39.3282 1.96223e-10Z"
              fill="currentColor"
            />
          </svg>
          <button
            onClick={onClose}
            className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-4 space-y-1">
            {menuCollections.map((item) => (
              <div key={item.handle}>
                {item.subcollections ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.handle)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                        {item.title}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedMenu === item.handle ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedMenu === item.handle && (
                      <div className="bg-gray-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <button
                            onClick={() => setExpandedMenu(null)}
                            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            {item.title}
                          </button>
                          <Link
                            href={`/collections/${item.handle}`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                            onClick={onClose}
                          >
                            See All
                          </Link>
                        </div>
                        <div className="space-y-1">
                          {item.subcollections.map((subItem) => (
                            <Link
                              key={subItem.handle}
                              href={`/collections/${subItem.handle}`}
                              className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              onClick={onClose}
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/collections/${item.handle}`}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Footer Links */}
          <div className="border-t border-gray-200 mt-6">
            <div className="py-4 space-y-1">
              <Link
                href="/pages/contact"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={onClose}
              >
                FAQs
              </Link>
              <Link
                href="/pages/business-commercial"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={onClose}
              >
                Trade
              </Link>
              <Link
                href="/pages/accounts"
                className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={onClose}
              >
                Manage my orders
              </Link>
            </div>

            {/* Country Selector */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="w-4 h-3 bg-blue-600 rounded-sm" />
                <span className="text-sm font-medium">Australia AUD $</span>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
