import React from 'react'
import { Truck, Shield, Headphones, Star } from 'lucide-react'

const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Free Shipping',
      description: 'On orders over $50',
      icon: Truck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Secure Payment',
      description: '100% secure transactions',
      icon: Shield,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      title: '24/7 Support',
      description: 'Always here to help',
      icon: Headphones,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 4,
      title: 'Quality Products',
      description: 'Guaranteed quality items',
      icon: Star,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <section className='py-16 bg-[#FAF7F2]'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map(feature => {
            const IconComponent = feature.icon
            return (
              <div key={feature.id} className='flex flex-col items-center text-center'>
                <div className={`${feature.iconBg} p-4 rounded-full mb-4`}>
                  <IconComponent className={`${feature.iconColor} w-8 h-8`} />
                </div>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>{feature.title}</h3>
                <p className='text-gray-600 text-sm'>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
