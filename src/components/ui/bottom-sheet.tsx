"use client";

import { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export function BottomSheet({ open, onClose, title, children, fullHeight }: BottomSheetProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <DialogPanel
                className={`w-full max-w-lg transform rounded-t-2xl bg-navy-900 border-t border-navy-700 transition-all ${
                  fullHeight ? "min-h-[90vh]" : "max-h-[85vh]"
                }`}
              >
                <div className="flex items-center justify-between border-b border-navy-800 px-4 py-3">
                  <div className="mx-auto h-1 w-10 rounded-full bg-navy-700 absolute left-1/2 -translate-x-1/2 top-2" />
                  {title && (
                    <h2 className="text-lg font-semibold text-navy-300 mt-2">{title}</h2>
                  )}
                  <button
                    onClick={onClose}
                    className="ml-auto rounded-lg p-2 text-navy-500 hover:text-navy-300 mt-2"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 60px)" }}>
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
