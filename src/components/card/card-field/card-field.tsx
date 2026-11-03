import styles from "./card-field.module.css";

type CardFieldProps = {
  label: string;
  value: string | number;
  className?: string;
};

/** A small uppercase caption over a value. Renders nothing when the value is empty. */
export function CardField({ label, value, className = "" }: CardFieldProps) {
  if (value === "") return null;
  return (
    <div className={`${styles.field} ${className}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
