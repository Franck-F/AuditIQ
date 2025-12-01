content = """NEXT_PUBLIC_SUPABASE_URL=https://qpgwotsodziznwigpjey.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZ3dvdHNvZHppem53aWdwamV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjYyODgsImV4cCI6MjA3OTE0MjI4OH0.IW4fahQvBNSpmjFWP9oQnpZwXf4UtXgboV9m1M4OFaI
NEXT_PUBLIC_API_URL=http://localhost:8000
"""
with open(".env.local", "w") as f:
    f.write(content)
print("Created .env.local")
