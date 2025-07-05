import csv
import os
from typing import List, Dict, Any

class DataManager:
    def __init__(self):
        # Initialize the data manager
        self.teams_file = 'data/teams.csv'
        self.data = []
        self.headers = ['TeamNumber', 'Name', 'Type1', 'Type2', 'DexNum', 'Extra']
        
        # Create data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)

    def save_teams(self, teams_data):
        """Save teams data to CSV"""
        try:
            with open(self.teams_file, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=self.headers)
                writer.writeheader()
                for team in teams_data:
                    writer.writerows(team)
            return {
                'success': True,
                'message': 'Teams saved successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error saving teams: {str(e)}'
            }

    def load_teams(self):
        """Load teams data from CSV"""
        try:
            if not os.path.exists(self.teams_file):
                return {
                    'success': True,
                    'message': 'No saved teams found',
                    'data': []
                }
            
            teams_data = []
            with open(self.teams_file, 'r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                teams_data = list(reader)
            
            return {
                'success': True,
                'message': 'Teams loaded successfully',
                'data': teams_data
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error loading teams: {str(e)}',
                'data': []
            }