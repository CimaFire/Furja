import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { streamsService } from '../services/api';
import { setStreams } from '../store/slices/streamsSlice';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { streams } = useSelector(state => state.streams);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setRefreshing(true);
    try {
      const response = await streamsService.getActiveStreams();
      dispatch(setStreams(response.data));
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderStreamCard = ({ item }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => navigation.navigate('Stream', { streamId: item.id })}
    >
      <View style={styles.streamHeader}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        {item.status === 'live' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>🔴 مباشر</Text>
          </View>
        )}
      </View>
      <View style={styles.streamInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.viewers}>👥 {item.viewer_count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 فُرجه</Text>
      </View>

      {streams.length > 0 ? (
        <FlatList
          data={streams}
          renderItem={renderStreamCard}
          keyExtractor={item => item.id.toString()}
          refreshing={refreshing}
          onRefresh={fetchStreams}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد بث مباشر الآن</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  listContent: {
    padding: 16,
  },
  streamCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  liveBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    color: '#9ca3af',
    fontSize: 14,
  },
  viewers: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});
