import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface GameDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
}

// Custom Input Button for react-datepicker
const CustomDateInput = forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="game-input"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: '12px 16px',
      backgroundColor: '#FFFFFF',
      textAlign: 'left',
      width: '100%',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-background-secondary)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CalendarIcon size={16} />
      </div>
      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
        {value || 'Chọn ngày sinh'}
      </span>
    </div>

    <ChevronDown size={16} color="var(--color-text-secondary)" />
  </button>
));

CustomDateInput.displayName = 'CustomDateInput';

export const GameDatePicker: React.FC<GameDatePickerProps> = ({
  value,
  onChange,
  label = 'Ngày tháng năm sinh:',
}) => {
  // Parse date from YYYY-MM-DD
  const selectedDate = React.useMemo(() => {
    if (!value) return new Date(2000, 8, 16);
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];
    for (let y = currentYear; y >= 1980; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}
        >
          <CalendarIcon size={15} color="var(--color-primary)" />
          <span>{label}</span>
        </label>
      )}

      <div style={{ width: '100%' }}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          minDate={new Date(1980, 0, 1)}
          customInput={<CustomDateInput />}
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div
              style={{
                margin: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                style={{
                  border: 'none',
                  background: 'var(--color-background-secondary)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={months[date.getMonth()]}
                  onChange={({ target: { value: val } }) => changeMonth(months.indexOf(val))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    background: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {months.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value: val } }) => changeYear(Number(val))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    background: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                style={{
                  border: 'none',
                  background: 'var(--color-background-secondary)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};
