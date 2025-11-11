"use client";

import React, { useState } from "react";
import Select from "react-select";

function FilterComponent({ options }) {
  const selectOptions = options.map((o) => ({ value: o, label: o }));
  const [status, setStatus] = useState(selectOptions[0]); // initial value

  const handleChange = (selectedOption) => {
    setStatus(selectedOption);
    console.log("Selected:", selectedOption.value);
  };

  return (
    <div className="border-gray-300 rounded z-50">
      <Select
        defaultValue={selectOptions[0]}
        value={status}
        onChange={handleChange}
        options={selectOptions}
      />
    </div>
  );
}

export default FilterComponent;
