import styles from 'components/pages/home/HomePage.module.scss';
import { format } from 'utils/date';

export default function Navbar({
  month = new Date(),
  onChangeMonth,
}: {
  month?: Date,
  onChangeMonth: (newDate: Date) => void,
}) {
  const toPrevMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);

    onChangeMonth(newDate);
  };

  const toNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);

    onChangeMonth(newDate);
  };

  return (
    <div className={styles['navbar']}>
      <div className={styles['navbar__content']}>
        <button className="text-button" onClick={toPrevMonth} type="button">
          &#10094;
        </button>

        {format({ date: month, format: 'MMM YYYY' })}

        <button className="text-button" onClick={toNextMonth} type="button">
          &#10095;
        </button>
      </div>
    </div>
  );
};
