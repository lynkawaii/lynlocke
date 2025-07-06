import csv
import os
from typing import List, Dict, Any

class DataManager:
    def __init__(self):
        self.teams_file = 'data/teams.csv'
        self.matchups_file = 'data/matchups.csv'  # New file for matchups
        self.teams_headers = ['TeamNumber', 'Name', 'Type1', 'Type2', 'DexNum', 'Extra']
        self.matchups_headers = ['P1Dex', 'P2Type2', 'P1Type1', 'P1Name', 'P2Name', 'P2Type1', 'P2Type2', 'P2Dex']
        os.makedirs('data', exist_ok=True)


    def save_teams(self, teams_data):
        """Save teams and matchups data"""
        try:
            # Save teams data
            with open(self.teams_file, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=self.teams_headers)
                writer.writeheader()
                for team in data['teams']:
                    writer.writerows(team)
            
            # Save matchups data
            with open(self.matchups_file, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=self.matchups_headers)
                writer.writeheader()
                writer.writerows(data['matchups'])
            
            return {
                'success': True,
                'message': 'Teams and matchups saved successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error saving data: {str(e)}'
            }

    def load_teams(self):
        """Load teams and matchups data"""
        try:
            result = {
                'teams': [],
                'matchups': [],
                'success': True,
                'message': 'Data loaded successfully'
            }

            # Load teams if file exists
            if os.path.exists(self.teams_file):
                with open(self.teams_file, 'r', newline='', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    result['teams'] = list(reader)

            # Load matchups if file exists
            if os.path.exists(self.matchups_file):
                with open(self.matchups_file, 'r', newline='', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    result['matchups'] = list(reader)

            return result
        except Exception as e:
            return {
                'success': False,
                'message': f'Error loading data: {str(e)}',
                'teams': [],
                'matchups': []
            }