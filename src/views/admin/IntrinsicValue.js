import React from "react";

// components

import IntrinsicValueComp from 'components/IntrisicValueComp/IntrisicValueComp';

export default function IntrinsicValue() {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <IntrinsicValueComp />
          </div>
        </div>
      </div>
    </>
  );
}
