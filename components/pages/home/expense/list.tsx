import { useMemo, useState } from 'react';

import styles from 'components/pages/home/HomePage.module.scss';
import { format, groupByDate } from 'utils/date';
import { separateThousand } from 'utils/number';


import type { Expense } from 'types/models/expense';

export default function ExpenseList({
  data,
  onClick,
}: {
  data: Expense[];
  onClick: (arg0?: Expense) => void;
}) {
  const [showRecap, setShowRecap] = useState(false);

  const dataByDate = useMemo(() => groupByDate({
    items: data,
    getDate: (data) => data.date || new Date(),
  }), [data]);

  const amountByCategory = useMemo(() => data.reduce(
    (acc, { category, amount }) => {
      if (category in acc) {
        return {
          ...acc,
          [category]: acc[category] + amount,
        };
      }

      return {
        ...acc,
        [category]: amount,
      }; 
    },
    {} as Record<string, number>,
  ), [data]);

  if (data.length === 0) {
    return (
      <div className={styles['expense-list']}>
        <div className={styles['expense-list__empty']}>No transactions</div>
      </div>
    );
  }

  const renderList = () => (
    <div className={styles['expense-list__list']}>
      {Object.keys(dataByDate).map((date) => {
        const data = dataByDate[date];

        return (
          <div key={date} className={styles['expense-list__list__date']}>
            <center className={styles['expense-list__list__date__header']}>
              {format({ date: data[0].date, format: 'D MMM YYYY' })}
            </center>
          
            <div className={styles['expense-list__list__date__data']}>
              {data.map((expense) => {
                const {
                  id,
                  amount,
                  category,
                  description,
                } = expense;

                return (
                  <button
                    key={id}
                    className={styles['expense-list__list__date__data__expense']}
                    onClick={() => onClick(expense)}
                    type="button"
                  >
                    <span className={styles['expense-list__list__date__data__expense__description']}>
                      <small>{category}</small>
                      <br />
                      {description || ''}
                    </span>

                    <b className={styles['expense-list__list__date__data__expense__amount']}>
                      {amount ? separateThousand(amount) : '0'}
                    </b>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <br />
      <center><small>End of list</small></center>
    </div>
  );

  const renderRecap = () => (
    <div className={styles['expense-list__recap']}>
      {Object.keys(amountByCategory).map((category) => (
        <div key={category} className={styles['expense-list__recap__category']}>
          <p>{category}</p>
          <b>{separateThousand(amountByCategory[category])}</b>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles['expense-list']}>
      {showRecap
        ? renderRecap()
        : renderList()}

      <div className={styles['expense-list__summary']}>
        <button
          className={`text-button ${styles['expense-list__summary__detail']}`}
          onClick={() => setShowRecap((prevState) => !prevState)}
          type="button"
        >
          <span>{`${data.length} Transaction(s)`}</span>
          <br />
          {showRecap ? <b>RECAP &#9660;</b> : <b>RECAP &#9650;</b>}
        </button>

        <div className={styles['expense-list__summary__total']}>
          {separateThousand(data.reduce((acc, { amount }) => acc + (amount || 0), 0))}
        </div>

        <button
          className={`text-button ${styles['expense-list__summary__add']}`}
          onClick={() => onClick()}
          type="button"
        >
          &#43;
        </button>
      </div>
    </div>
  );
};
