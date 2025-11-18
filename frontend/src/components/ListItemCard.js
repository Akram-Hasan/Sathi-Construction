import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListItemCard({
  title,
  subtitle,
  description,
  rightContent,
  onPress,
  icon,
  iconColor,
  badge,
  badgeColor,
  style,
}) {
  const content = (
    <View style={[styles.card, style]}>
      {icon && (
        <View style={[styles.iconContainer, iconColor && { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon} size={20} color={iconColor || '#22c55e'} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {badge && (
            <View style={[styles.badge, badgeColor && { backgroundColor: badgeColor.bg }]}>
              <Text style={[styles.badgeText, badgeColor && { color: badgeColor.text }]}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
      </View>
      {rightContent || (
        onPress && (
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        )
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1f2937',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

