const Banner = () => {
  return (
    <div className="flex justify-between items-center bg-blue-400 border-y border-black py-10 lg:p-0">
        <div className="px-10 space-y-5">
            <h1 className="text-6xl max-w-xl">
                <span className="underline decoration-black decoration-4">Medium</span> is a place to write, read, and connect
            </h1>
            <h2>
                It's easy and free to post your thinking on any topic and connect with millions of readers
            </h2>
            <button className="bg-white rounded-full px-4 py-1 border border-black cursor-auto">
                Start Writing
            </button>
        </div>
        <div>
            <img className="hidden md:inline-flex h-32 lg:h-full" src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" alt="medium logo" />
        </div>
    </div>
  )
}

export default Banner