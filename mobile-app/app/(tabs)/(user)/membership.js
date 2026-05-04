import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import theme from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import MembershipCard from "@/components/MembershipCard";
import Card from "@/components/Card";
import { CreditCard, Award } from "lucide-react-native";

export default function MembershipScreen() {
  const user = useUserStore((state) => state.user);

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Membership Card</Text>

      <MembershipCard />

      <View style={styles.infoSection}>
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <CreditCard size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>Card Benefits</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitBullet} />
            <Text style={styles.benefitText}>Exclusive member-only offers</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitBullet} />
            <Text style={styles.benefitText}>
              Earn points on every purchase
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitBullet} />
            <Text style={styles.benefitText}>
              Free shipping on orders over $50
            </Text>
          </View>
        </Card> 

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Award size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>Membership Levels</Text>
          </View>
          <View style={styles.levelItem}>
            <Text style={styles.levelName}>Bronze</Text>
            <Text style={styles.levelPoints}>0-1,000 points</Text>
          </View>
          <View style={styles.levelItem}>
            <Text style={styles.levelName}>Silver</Text>
            <Text style={styles.levelPoints}>1,001-2,000 points</Text>
          </View>
          <View style={styles.levelItem}>
            <Text style={[styles.levelName]}>Gold</Text>
            <Text style={[styles.levelPoints]}>
              2,001-5,000 points
            </Text>
          </View>
          <View style={styles.levelItem}>
            <Text style={styles.levelName}>Platinum</Text>
            <Text style={styles.levelPoints}>5,001+ points</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
    paddingTop: 70,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.m,
  },
  infoSection: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    marginBottom: theme.spacing.m,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  infoTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  benefitBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.s,
  },
  benefitText: {
    ...theme.typography.body,
  },
  levelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },
  levelName: {
    ...theme.typography.body,
  },
  levelPoints: {
    ...theme.typography.bodySmall,
  },
  currentLevel: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  transactionsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.s,
  },
  noTransactionText: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
    color: theme.colors.error
  }
});
