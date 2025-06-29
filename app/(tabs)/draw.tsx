// app/(tabs)/draw.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Temporarily comment out canvas imports until we fix the drawing engine
// import { DrawingCanvas, BrushSystem } from '../../src/engines/drawing';

export default function DrawScreen() {
  const [selectedBrush, setSelectedBrush] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [showTools, setShowTools] = useState(true);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  ];

  const brushes = [
    { id: 'pencil', name: 'Pencil' },
    { id: 'pen', name: 'Pen' },
    { id: 'brush', name: 'Brush' },
    { id: 'eraser', name: 'Eraser' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvasContainer}>
        <Text style={styles.placeholderText}>Drawing Canvas</Text>
        <Text style={styles.subText}>Launching Soon!</Text>
      </View>
      
      {showTools && (
        <View style={styles.toolbar}>
          {/* Brushes */}
          <ScrollView horizontal style={styles.brushSection}>
            {brushes.map(brush => (
              <TouchableOpacity
                key={brush.id}
                style={[
                  styles.brushButton,
                  selectedBrush === brush.id && styles.selectedBrush
                ]}
                onPress={() => setSelectedBrush(brush.id)}
              >
                <Text style={[
                  styles.brushText,
                  selectedBrush === brush.id && styles.selectedText
                ]}>
                  {brush.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Colors */}
          <ScrollView horizontal style={styles.colorSection}>
            {colors.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  { backgroundColor: c },
                  color === c && styles.selectedColor
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setShowTools(!showTools)}
      >
        <Text style={styles.toggleText}>{showTools ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  brushSection: {
    marginBottom: 10,
  },
  brushButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  selectedBrush: {
    backgroundColor: '#007AFF',
  },
  brushText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  colorSection: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedColor: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
  },
});