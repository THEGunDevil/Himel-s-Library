"use client";

import React, { useState } from "react";
import Select from "react-select";

function FilterComponent({ options,onChange }) {
  const selectOptions = options.map((o) => ({ value: o, label: o }));
  const [status, setStatus] = useState(selectOptions[0]); // initial value

  const handleChange = (selectedOption) => {
    setStatus(selectedOption);
    if (onChange) {
      onChange(selectedOption.value); // send value to parent
    }
  };
  return (
    <div className="border-gray-300 rounded z-50">
      <Select
        isSearchable={false}
        defaultValue={selectOptions[0]}
        value={status}
        onChange={handleChange}
        options={selectOptions}
      />
    </div>
  );
}

export default FilterComponent;
