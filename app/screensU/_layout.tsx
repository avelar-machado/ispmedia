import { Tabs } from 'expo-router';
import React from 'react';
import CustomHeader from '@/components/CustomHeader';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams  } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { username, code } = useLocalSearchParams(); 

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        header: (props) => <CustomHeader {...props} routeName={route.name} />,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        initialParams={{ username, code }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Radios"
        initialParams={{ username, code }}
        options={{
          title: 'Rádios',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'radio' : 'radio-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Pesquisa"
        initialParams={{ username, code }}
        options={{
          title: 'Pesquisa',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
