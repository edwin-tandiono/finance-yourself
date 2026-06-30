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
  const [categoryFilter, setCategoryFilter] = useState('all');

  const dataByDate = useMemo(() => groupByDate({
    items: data.filter((item) => {
      if (categoryFilter === 'all') {
        return true;
      }

      return item.category === categoryFilter;
    }),
    getDate: (data) => data.date || new Date(),
  }), [data, categoryFilter]);

  const { amountByCategory, countByCategory } = useMemo(() => data.reduce(
    (acc, { category, amount }) => {
      if (category in acc.amountByCategory) {
        return {
          amountByCategory: {
            ...acc.amountByCategory,
            all: acc.amountByCategory.all + amount,
            [category]: acc.amountByCategory[category] + amount,
          },
          countByCategory: {
            ...acc.countByCategory,
            all: acc.countByCategory.all + 1,
            [category]: acc.countByCategory[category] + 1,
          },
        };
      }

      return {
        amountByCategory: {
          ...acc.amountByCategory,
          all: acc.amountByCategory.all + amount,
          [category]: amount,
        },
        countByCategory: {
          ...acc.countByCategory,
          all: acc.countByCategory.all + 1,
          [category]: 1,
        },
      };
    },
    {
      amountByCategory: { all: 0 },
      countByCategory: { all: 0 },
    } as { amountByCategory: Record<string, number>, countByCategory: Record<string, number> },
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
            <button
              className={`text-button ${styles['expense-list__list__date__header']}`}
              onClick={() => onClick({
                id: '',
                amount: 0,
                category: '',
                description: '',
                date: new Date(data[0].date),
              })}
            >
              {format({ date: data[0].date, format: 'D MMM YYYY' })}
            </button>
          
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
        <button
          key={category}
          className={`text-button ${styles['expense-list__recap__category']} ${
            category === categoryFilter ? styles['expense-list__recap__category--active'] : ''
          }`}
          onClick={() => {
            setCategoryFilter(category);
            setShowRecap(false);
          }}
          type="button"
        >
          <p>{category}</p>
          <b>{separateThousand(amountByCategory[category])}</b>
        </button>
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
          <span>{`${countByCategory[categoryFilter]} Transaction(s)`}</span>
          <br />
          <b>
            {categoryFilter}
            &nbsp;
            {showRecap ? <span>&#9660;</span> : <span>&#9650;</span>}
          </b>
        </button>

        <div className={styles['expense-list__summary__total']}>
          {separateThousand(amountByCategory[categoryFilter] || 0)}
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
