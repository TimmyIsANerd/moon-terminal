import React from 'react'

const Post = () => {
  return (
    <div className='post p-3 my-5'>
        <div className='flex flex-row gap-3'>
            <img src="https://ichef.bbci.co.uk/news/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg" width="40px" height="auto" style={{border: '0px solid', borderRadius:'100%'}}/>
            <div>
                <p className='text-lg font-bold'>username</p>
                <p className='text-xs'>01.01.2021</p>
            </div>
        </div>
        <p className='mt-3'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam semper id nunc et dictum. Fusce nec sagittis magna, ut maximus ante. Interdum et malesuada fames ac ante ipsum primis in faucibus.   
        </p>
        <hr className='mt-3'/>
        <div className="grid grid-cols-10 gap-2 my-3">
            <input className=" rounded focus:outline-none text-foreground w-full col-span-9"/>
            <button
            className="bg-[#BD93F9] text-[#282934] rounded hover:bg-pink font-bold py-1 px-1 mr-2 w-full col-span-1"
            >
            submit
            </button>
        </div>
    </div>
  )
}

export default Post