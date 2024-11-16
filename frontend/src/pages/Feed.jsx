import React from 'react'
import Post from '../components/Post'

const Feed = () => {
  return (
    <div className='page-layout'>
        <textarea className=" rounded focus:outline-none text-foreground w-full "/>
        <button
        className="bg-[#BD93F9] text-[#282934] rounded hover:bg-pink font-bold py-1 px-1 mr-2 w-full col-span-1"
        >
        submit
        </button>

        <Post />
    </div>
  )
}

export default Feed