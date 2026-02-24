import { FontAwesome5 } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { invigilatorTheme } from "../theme/invigilatorTheme";

interface VerificationCardProps {
  title: string;
  description: string;
  icon: string;
  route: Href;
  colors?: string[]; // Optional colors array
}

export default function VerificationCard({
  title,
  description,
  icon,
  route,
  colors,
}: VerificationCardProps) {
  const iconColor = colors?.[0] || invigilatorTheme.colors.primary;

  return (
    <Link href={route} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}> 
          <FontAwesome5 name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: invigilatorTheme.colors.border,
  },
  iconContainer: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: invigilatorTheme.colors.text,
  },
  description: {
    color: invigilatorTheme.colors.subtext,
    lineHeight: 18,
  },
});
