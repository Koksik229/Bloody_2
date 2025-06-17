from migrations.add_available_points import upgrade

if __name__ == "__main__":
    print("Applying migrations...")
    upgrade()
    print("Migrations applied successfully!") 