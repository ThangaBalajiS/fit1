'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';

interface DatePickerProps {
  selectedDate: Date | string;
  onChange: (date: Date) => void;
  label?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  placeholder?: string;
}

export default function DatePicker({
  selectedDate,
  onChange,
  label = 'Date',
  className = '',
  minDate,
  maxDate,
  showTime = false,
  placeholder = 'Select date'
}: DatePickerProps) {
  // Convert string date to Date object if necessary
  const initialDate = typeof selectedDate === 'string' && selectedDate
    ? parseISO(selectedDate)
    : selectedDate instanceof Date
      ? selectedDate
      : new Date();

  // State for internal date handling
  const [dateValue, setDateValue] = useState<string>(
    isValid(initialDate)
      ? format(initialDate, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd')
      : ''
  );

  // Update date value when selectedDate prop changes
  useEffect(() => {
    if (typeof selectedDate === 'string' && selectedDate) {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) {
        setDateValue(format(parsed, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd'));
      }
    } else if (selectedDate instanceof Date && isValid(selectedDate)) {
      setDateValue(format(selectedDate, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd'));
    }
  }, [selectedDate, showTime]);

  // Handle date change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateValue(value);
    
    const parsed = new Date(value);
    if (isValid(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          {label}
        </label>
      )}
      <input
        type={showTime ? "datetime-local" : "date"}
        value={dateValue}
        onChange={handleChange}
        min={minDate ? format(minDate, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd') : undefined}
        max={maxDate ? format(maxDate, showTime ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd') : undefined}
        placeholder={placeholder}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      />
    </div>
  );
} 