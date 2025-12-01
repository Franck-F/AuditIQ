import traceback
import sys
try:
    import main
    print("Import successful")
except Exception:
    traceback.print_exc()
except SystemExit:
    pass
