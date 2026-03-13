import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

// Temporary placeholder screens
const CustomersScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Customers Screen</Text>
  </View>
);

const ProjectsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Projects Screen</Text>
  </View>
);

const AccountingScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Accounting Screen</Text>
  </View>
);

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A100A',
          },
          headerTintColor: '#D4AF37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Customers" 
          component={CustomersScreen} 
          options={{ title: 'NVH Agri System' }}
        />
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="Accounting" component={AccountingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A100A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#D4AF37',
    fontSize: 18,
  },
});