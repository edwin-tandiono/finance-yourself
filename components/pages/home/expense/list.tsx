import { useMemo } from 'react';

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
  const dataByDate = useMemo(() => groupByDate({
    items: data,
    getDate: (data) => data.date || new Date(),
  }), [data]);

  return (
    <div className={styles['expense-list']}>
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

                      <span className={styles['expense-list__list__date__data__expense__amount']}>
                        {amount ? separateThousand(amount) : '0'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          className={`text-button ${styles['expense-list__list__add']}`}
          onClick={() => onClick()}
          type="button"
        >
          &#43;
        </button>
      </div>

      <div className={styles['expense-list__summary']}>
        <div>{`${data.length} Transaction(s)`}</div>
        <div>{separateThousand(data.reduce((acc, { amount }) => acc + (amount || 0), 0))}</div>
      </div>
    </div>
  );
};
