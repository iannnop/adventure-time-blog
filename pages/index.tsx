import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { Post } from '../types'
import Banner from '../components/Banner'
import { sanityClient, urlFor } from '../sanity'
import Link from 'next/link'

interface Props {
  posts: Post[]
}

const Home: NextPage<Props> = ({ posts }) => {
  return (
    <div className='max-w-7xl mx-auto'>
      <Head>
        <title>Adventure Time Blog</title>
        <meta name='description' content='An Adventure Time Blog' />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Banner />

      {/* Post Cards */}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6'>
        {posts.map((post: Post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className='border rounded-lg group cursor-pointer overflow-hidden'>
              <img className='h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out' src={urlFor(post.mainImage.asset._ref).url()!} alt={`${post.title} mainImage`} />
              <div className='flex justify-between p-5 bg-white'>
                <div>
                  <p className='text-lg font-bold'>{post.title}</p>
                  <p className='text-xs'>{post.description} by {post.author.name}</p>
                </div>
                <img className='h-12 w-12 rounded-full' src={urlFor(post.author.image).url()!} alt={`${post.author.name}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    author -> {
    name,
    image,
    },
    description,
    mainImage,
    slug
  }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    }
  }
}
