import webview
from backend import DataManager

def main():
    # Create an instance of your data manager
    data_manager = DataManager()
    
    # Create the webview window
    webview.create_window(
        'Lynlocke: Sunshine',
        'frontend/index.html',
        width=1000,
        height=700,
        min_size=(800, 600),
        js_api=data_manager
    )
    
    # Start the application
    webview.start(debug=True)

if __name__ == '__main__':
    main()