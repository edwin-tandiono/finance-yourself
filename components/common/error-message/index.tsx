export default function ErrorMessage({
  children = null,
}: { children?: React.ReactNode }) {
  if (!children) {
    return null;
  }

  return <p>{children}</p>;
}
