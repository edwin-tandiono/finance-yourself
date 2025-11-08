export function Welcome() {
  console.log('===', import.meta.env)
  return (
    <div>
      <h1>FINANCE YOURSELF</h1>
      <span>{`Test env:"${import.meta.env.VITE_TEST_ENV}"`}</span>
    </div>
  );
}
