import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileMenu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      icon: "edit",
      label: "Update Profile",
      onPress: () => router.push("../profile/update"),
    },
    {
      icon: "delete",
      label: "Delete Account",
      onPress: () => router.push("../profile/delete"),
      color: "#F44336",
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible(!visible)}>
        <MaterialIcons name="account-circle" size={60} color="#6E3BFF" />
      </TouchableOpacity>

      {visible && (
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                item.onPress();
                setVisible(false);
              }}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.color || "#333"}
              />
              <Text
                style={[styles.menuText, item.color && { color: item.color }]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  menu: {
    position: "absolute",
    right: 0,
    top: 70,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
