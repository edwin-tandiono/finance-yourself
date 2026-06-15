import { useMemo } from 'react';

import styles from 'components/pages/home/HomePage.module.scss';
import { format, groupByDate } from 'utils/date';
import { separateThousand } from 'utils/number';


import type { Expense } from 'types/models/expense';

export default function ExpenseList({
  data,
}: {
  data: Expense[];
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
              <div className={styles['expense-list__list__date__header']}>
                {format({ date: data[0].date, format: 'D MMM YYYY' })}
              </div>
            
              <div className={styles['expense-list__list__date__data']}>
                {data.map(({
                  id,
                  amount,
                  description,
                }) => (
                  <button
                    key={id}
                    className={styles['expense-list__list__date__data__expense']}
                    onClick={() => {}}
                    type="button"
                  >
                    <span className={styles['expense-list__list__date__data__expense__description']}>
                      {description || ''}
                    </span>

                     <span className={styles['expense-list__list__date__data__expense__amount']}>
                      {amount ? separateThousand(amount) : '0'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles['expense-list__summary']}>
        <span>{`${data.length} Transaction(s)`}</span>
        <b>{separateThousand(data.reduce((acc, { amount }) => acc + (amount || 0), 0))}</b>
      </div>
    </div>
  );
};
