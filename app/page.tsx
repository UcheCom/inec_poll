import React from 'react';

export default function Home() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Available Polls</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
          <h2 className='text-xl font-semibold mb-2'>Presidential Election 2023</h2>
          <p className='text-gray-600 mb-4'>Vote for your preferred presidential candidate</p>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Created: 2023-01-15</span>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
              View Poll
            </button>
          </div>
        </div>
        <div className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
          <h2 className='text-xl font-semibold mb-2'>Gubernatorial Election - Lagos State</h2>
          <p className='text-gray-600 mb-4'>Vote for your preferred gubernatorial candidate</p>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Created: 2023-02-20</span>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
              View Poll
            </button>
          </div>
        </div>
        <div className='border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
          <h2 className='text-xl font-semibold mb-2'>Senatorial Election - FCT</h2>
          <p className='text-gray-600 mb-4'>Vote for your preferred senatorial candidate</p>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Created: 2023-03-10</span>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm'>
              View Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
