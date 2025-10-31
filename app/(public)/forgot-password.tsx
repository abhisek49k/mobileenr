import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const Forgotpassword = () => {

  const router = useRouter();

  return (
    <View>
      <Text>forgot-password</Text>
      <TouchableOpacity className="bg-accent-primary px-6 py-3 rounded-xl" onPress={() => router.push('/login')}>
        <Text className="text-white font-medium">Go to login</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Forgotpassword