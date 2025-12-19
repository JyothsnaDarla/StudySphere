export default function News() {
  return (
    <div className="min-h-screen w-full pt-16">
      <iframe
        src="https://yournewsdaily.netlify.app/"
        className="w-full h-[calc(100vh-4rem)] border-0"
        title="News Daily"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
