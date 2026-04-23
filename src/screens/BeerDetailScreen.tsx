import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import apiClient from '../lib/apiClient';
import { useBeerStore } from '../stores/beerStore';
import { useAppTheme } from '../theme/useAppTheme';

export default function BeerDetailScreen({ route, navigation }: any) {
  const theme = useAppTheme();
  const { beerId } = route.params;
  const { deleteBeer, consumeBeer } = useBeerStore();
  const [beer, setBeer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(theme);

  useEffect(() => {
    fetchBeer();
  }, [beerId]);

  const fetchBeer = async () => {
    try {
      const response = await apiClient.get(`/beers/${beerId}`);
      setBeer(response.data.data.beer);
    } catch (error) {
      Alert.alert('Error', 'Failed to load beer details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Beer',
      'Are you sure you want to delete this beer?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteBeer(beerId);
              Alert.alert('Success', 'Beer deleted');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete beer');
            }
          },
        },
      ]
    );
  };

  const handleConsume = async () => {
    try {
      await consumeBeer(beerId);
      Alert.alert('Success', 'Beer marked as consumed');
      fetchBeer();
    } catch (error) {
      Alert.alert('Error', 'Failed to update beer');
    }
  };

  if (loading || !beer) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BEER DETAILS</Text>
        <Text style={styles.name}>{beer.name}</Text>
        <Text style={styles.brewery}>{beer.brewery}</Text>
      </View>

      <View style={styles.detailsSection}>
        {beer.style && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Style:</Text>
            <Text style={styles.value}>{beer.style}</Text>
          </View>
        )}

        {beer.abv && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>ABV:</Text>
            <Text style={styles.value}>{beer.abv}%</Text>
          </View>
        )}

        {beer.ibu && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>IBU:</Text>
            <Text style={styles.value}>{beer.ibu}</Text>
          </View>
        )}

        {beer.volume && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Volume:</Text>
            <Text style={styles.value}>{beer.volume}</Text>
          </View>
        )}

        {beer.rating && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.value}>{'⭐'.repeat(Math.round(beer.rating))}</Text>
          </View>
        )}

        {beer.description && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{beer.description}</Text>
          </View>
        )}
      </View>

      <View
        style={[styles.statusBadge, beer.consumed && styles.statusConsumed]}
      >
        <Text style={styles.statusText}>{beer.consumed ? '✓ Consumed' : 'Available'}</Text>
      </View>

      <View style={styles.buttonSection}>
        {!beer.consumed && (
          <TouchableOpacity style={styles.buttonSuccess} onPress={handleConsume}>
            <Text style={styles.buttonText}>Mark as Consumed</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.buttonDanger} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    eyebrow: {
      fontSize: 11,
      letterSpacing: 1.5,
      fontWeight: '700',
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    name: {
      fontSize: 30,
      fontWeight: '800',
      marginBottom: 4,
      color: theme.colors.text,
    },
    brewery: {
      fontSize: 16,
      color: theme.colors.textMuted,
    },
    detailsSection: {
      backgroundColor: theme.colors.surface,
      marginTop: 12,
      marginBottom: 10,
      marginHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: {
      fontWeight: '700',
      color: theme.colors.text,
    },
    value: {
      color: theme.colors.textMuted,
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: 10,
    },
    statusBadge: {
      marginHorizontal: 20,
      backgroundColor: theme.colors.warningBg,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 20,
      alignItems: 'center',
    },
    statusConsumed: {
      backgroundColor: theme.colors.consumedBg,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.warningText,
    },
    buttonSection: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    buttonSuccess: {
      backgroundColor: theme.colors.primaryAlt,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonDanger: {
      backgroundColor: theme.colors.danger,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
