import Button from "../generic/Button";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full flex justify-end bg-transparent border-none shadow-none py-6 px-10">
       <Button href="/blog">Blog</Button>       
    </header>
  );
}