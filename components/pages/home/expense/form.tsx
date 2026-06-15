import { useEffect, useRef, useState } from 'react';

import styles from 'components/pages/home/HomePage.module.scss';
import { format, isSameDay } from 'utils/date';

import type { CreateExpensePayload, Expense } from 'types/models/expense';

const DEFAULT_FORM = {
  amount: 0,
  category: '',
  description: '',
  date: new Date(),
};

const CATEGORY_OPTIONS = [
  'food',
  'grocery',
  'utilities',
  'rent',
  'tertier',
  'hedon',
];

export default function ExpenseForm ({
  onClose,
  onDelete,
  onSubmit,
  open,
  prefill,
}: {
  onClose: () => void,
  onDelete: (expense: Expense) => void,
  onSubmit: (expense: Expense | CreateExpensePayload) => void,
  open: boolean,
  prefill?: Expense,
}) {
  const initRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [currentCalendar, setCurrentCalendar] = useState(new Date());

  const canSubmit = (
    form.amount > 0
    && form.category
    && form.date
  );

  const handleChangeText = (e: { target: { name: string; value: string; type?: string; }; }) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setForm((prevState) => ({
        ...prevState,
        [name]: Number.isNaN(Number(value)) ? 0 : Number(value).toString(),
      }));

      return;
    }

    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeCalendar = (newDate: Date) => {
    setForm((prevState) => ({
      ...prevState,
      date: newDate,
    }));
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  
    if (!canSubmit) {
      return;
    }

    onSubmit({
      ...prefill,
      ...form,
      amount: Number(form.amount),
    });
  };

  useEffect(() => {
    if (open) {
      if (prefill) {
        setForm({
          amount: prefill.amount,
          category: prefill.category,
          description: prefill.description,
          date: prefill.date,
        });
        setCurrentCalendar(prefill.date);
      } else {
        setForm(DEFAULT_FORM);
      }

      initRef?.current?.focus?.();
    }

  }, [prefill, open]);

  const renderCalendar = (): React.ReactNode => {
    const firstDate = new Date(currentCalendar.getFullYear(), currentCalendar.getMonth(), 1);
    const lastDate = new Date(currentCalendar.getFullYear(), currentCalendar.getMonth() + 1, 0);

    const lastPadCount = 6 - lastDate.getDay();
    const calendar: React.ReactNode[][] = [[]];
    
    let date = 1;

    while (date <= lastDate.getDate() + lastPadCount) {
      const currentDay = calendar[calendar.length - 1].length;

      // Pad first
      if (date === firstDate.getDate() && currentDay < firstDate.getDay()) {
        const newDate = new Date(currentCalendar);
        newDate.setDate(date);

        calendar[calendar.length - 1].push(
          <button key={`padfirst-${currentDay}`} disabled type="button" />,
        );

        continue;
      }

      // Create new row
      if (calendar[calendar.length - 1].length === 7) {
        calendar.push([]);

        continue;
      }

      // Render date
      if (date >= firstDate.getDate() && date <= lastDate.getDate()) {
        const newDate = new Date(firstDate);
        newDate.setDate(date);

        calendar[calendar.length - 1].push(
          <button
            key={date}
            className={`${
              styles['expense-form__calendar__week__date']
            } ${
              isSameDay(form.date, newDate)
                ? styles['expense-form__calendar__week__date--active']
                : ''
            }`}
            onClick={() => handleChangeCalendar(newDate)}
            type="button"
          >
            {date}
          </button>,
        );

        date += 1;

        continue;
      }

      // Pad last
      calendar[calendar.length - 1].push(
        <button key={`padlast-${currentDay}`} disabled type="button" />,
      );

      date += 1;

      continue;
    }

    return (
      <div className={styles['expense-form__calendar']}>
        <div className={styles['expense-form__calendar__slider']}>
          <button
            className="text-button"
            onClick={() => {
              setCurrentCalendar((prevState) => {
                const newCurrentCalendar = new Date(prevState);
                newCurrentCalendar.setMonth(prevState.getMonth() - 1);

                return newCurrentCalendar;
              });
            }}
            type="button"
          >
            &#10094;
          </button>

          {format({ date: currentCalendar, format: 'MMM YYYY' })}

           <button
            className="text-button"
            onClick={() => {
              setCurrentCalendar((prevState) => {
                const newCurrentCalendar = new Date(prevState);
                newCurrentCalendar.setMonth(prevState.getMonth() + 1);

                return newCurrentCalendar;
              });
            }}
            type="button"
          >
            &#10095;
          </button>
        </div>
        {calendar.map((week, index) => (
          <div key={`week-${index}`} className={styles['expense-form__calendar__week']}>
            {week}
          </div>
        ))}
      </div>
    );
  };

  if (!open) {
    return null;
  }

  return (
    <div className={styles['expense-form']}>
      <form onSubmit={handleSubmit}>
        <div className={styles['expense-form__header']}>
          <h1>
            {prefill
              ? `[${format({ date: prefill.date, format: 'D MMM YYYY' })}] ${prefill.description || prefill.category}`
              : 'Add Expense'}
          </h1>

          {prefill
            && (
              <button
                className="text-button"
                onClick={() => onDelete(prefill)}
                type="button"
              >
                &#9003;
              </button>
            )}
        </div>

        <label>
          <span>Amount</span>
          <input
            ref={initRef}
            name="amount"
            onChange={handleChangeText}
            type="number"
            value={form.amount}
          />
        </label>

        <label>
          <span>Category</span>
          <input
            name="category"
            onChange={handleChangeText}
            value={form.category}
          />
          <div className={styles['expense-form__categories']}>
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                className={`text-button ${
                  styles['expense-form__categories__category']
                } ${
                  category === form.category
                    ? styles['expense-form__categories__category--active']
                    : ''
                }`}
                onClick={() => handleChangeText({ target: { name: 'category', value: category } })}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </label>

        <label>
          <span>Description</span>
          <textarea
            name="description"
            onChange={handleChangeText}
            rows={3}
            value={form.description}
          />

          <span>Date</span>
          <input readOnly value={format({ date: form.date, format: 'D MMM YYYY' })} />
          {renderCalendar()}
        </label>
      </form>

      <div className={styles['expense-form__buttons']}>
        <button onClick={onClose} type="button">
          𐌢
        </button>
        <button disabled={!canSubmit} onClick={handleSubmit} type="button">
          SUBMIT
        </button>
      </div>
    </div>
  );
}