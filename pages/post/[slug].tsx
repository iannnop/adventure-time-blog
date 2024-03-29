import { GetStaticPaths, GetStaticProps } from "next"
import { sanityClient, urlFor } from "../../sanity"
import { Post } from "../../types"
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from "react"
import Head from "next/head"

interface InputForm {
    _id: string
    name: string
    email: string
    comment: string
}

interface Props {
    post: Post
}

const Post = ({ post }: Props) => {
  const { register, handleSubmit, formState: {errors} } = useForm<InputForm>()
  const [submitted, setSubmitted] = useState(false)

  const onSubmit: SubmitHandler<InputForm> = async (data) => {
    await fetch('/api/createComment', {
        method: 'POST',
        body: JSON.stringify(data),
    }).then(() => {
        console.log(data)
        setSubmitted(true)
    }).catch((err) => {
        console.log(err)
        setSubmitted(false)
    })
  }

  return (
    <>
    <Head>
        <title>Adventure Time Blog: {post.title}</title>
        <meta name='description' content={`${post.title} - ${post.description}`} />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    <img className="w-full h-96 object-cover" src={urlFor(post.mainImage.asset._ref).url()} alt="mainImage article banner" />
    <main className="mx-4">
        <article className="max-w-3xl mx-auto">
            <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
            <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

            <div className="flex items-center space-x-2">
                <img className="w-10 h-10 rounded-full" src={urlFor(post.author.image).url()!} alt="author picture" />
                <p className="font-extralight text-sm">Blog Post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
            </div>

            <div className="mt-10">
                <PortableText
                  className=""
                  content={post.body}
                  dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                  projectId={process.env.NEXT_PUBLIC_PROJECT_ID!}
                  serializers={{
                    h1: (props: any) => (
                        <h1 className="text-2xl font-bold my-5" {...props} />
                    ),
                    h2: (props: any) => (
                        <h2 className="text-xl font-bold my-5" {...props} />
                    ),
                    li: ({ children }: any) => (
                        <li className="ml-4 list-disc">{children}</li>
                    ),
                    link: ({ href, children }: any) => (
                        <a href={href} className="text-blue-500 hover:underline">{children}</a>
                    ),
                  }}
                />
            </div>
        </article>

        <hr className="max-w-lg my-5 mx-auto border border-blue-500" />
        {submitted ? (
            <div className="flex flex-col text-center py-10 my-10 bg-blue-500 text-white max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
            </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 my-10 max-w-2xl mx-auto mb-10">
            <h3 className="text-sm text-blue-500">Enjoyed this article?</h3>
            <h4 className="text-3xl font-bold">Leave a comment below!</h4>
            <hr className="py-3 mt-2" />

            <input {...register("_id")} type='hidden' name="_id" value={post._id} />

            <label className="block mb-5">
                <span className="text-gray-700">Name</span>
                <input {...register("name", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-blue-500 outline-none focus:ring" placeholder="Lumpy Space Princess" type='text' />
            </label>
            <label className="block mb-5">
                <span className="text-gray-700">Email</span>
                <input {...register("email", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-blue-500 outline-none focus:ring" placeholder="lsp@LandOfOoo.com" type='email' />
            </label>
            <label className="block mb-5">
                <span className="text-gray-700">Comment</span>
                <textarea {...register("comment", { required: true })} className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-blue-500 outline-none focus:ring" placeholder="this is totally awesome" rows={8} />
            </label>

            {/* Errors when form validation fails */}

            <div className="flex flex-col p-5">
                {errors.name && (
                    <span className="text-red-500">* Name Field is required</span>
                )}
                {errors.email && (
                    <span className="text-red-500">* Email Field is required</span>
                )}
                {errors.comment && (
                    <span className="text-red-500">* Comment Field is required</span>
                )}
            </div>

            <input type='submit' className="shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer" />
        </form>
        )}

        {/* Comments */}

        <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow">
            <h3 className="text-4xl">Comments</h3>
            <hr className="my-2 pb-2"/>

            <div>
                {post.comments.map((comment) => (
                        <p><span className="text-blue-500">{comment.name}:</span> {comment.comment}</p>
                ))}
            </div>
        </div>
    </main>
    </>
  )
}

export default Post

export const getStaticPaths: GetStaticPaths = async () => {
    const query = `*[_type == "post"]{
        _id,
        slug {
        current
      }
      }`
    
    const posts = await sanityClient.fetch(query)

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback: "blocking",
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
          name,
          image,
        },
        'comments': *[
            _type == "comment" && post._ref == ^._id && approved == true
        ],
        description,
        mainImage,
        slug,
        body
      }`

    const post = await sanityClient.fetch(query, {
        slug: params?.slug
    })

    if (!post) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 60,
    }
}