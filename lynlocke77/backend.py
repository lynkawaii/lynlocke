import csv
import os
from typing import List, Dict, Any

class DataManager:
    def __init__(self):
        self.csv_file = 'data/records.csv'
        self.data = []
        self.headers = ['ID', 'Name', 'Email', 'Phone', 'Notes']
        self.next_id = 1
        
        # Create data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)
        
        # Load existing data on startup
        self.load_data()
    
    def load_data(self):
        """Load data from CSV file"""
        try:
            if os.path.exists(self.csv_file):
                with open(self.csv_file, 'r', newline='', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    self.data = list(reader)
                    
                    # Set next_id based on existing data
                    if self.data:
                        max_id = max(int(row['ID']) for row in self.data)
                        self.next_id = max_id + 1
                    
                print(f"Loaded {len(self.data)} records from {self.csv_file}")
            else:
                print(f"No existing data file found. Starting with empty data.")
                
        except Exception as e:
            print(f"Error loading data: {e}")
            self.data = []
    
    def save_data(self):
        """Save data to CSV file"""
        try:
            with open(self.csv_file, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=self.headers)
                writer.writeheader()
                writer.writerows(self.data)
            print(f"Saved {len(self.data)} records to {self.csv_file}")
            return True
        except Exception as e:
            print(f"Error saving data: {e}")
            return False
    
    def add_record(self, name: str, email: str, phone: str, notes: str = ""):
        """Add a new record"""
        try:
            new_record = {
                'ID': str(self.next_id),
                'Name': name.strip(),
                'Email': email.strip(),
                'Phone': phone.strip(),
                'Notes': notes.strip()
            }
            
            self.data.append(new_record)
            self.next_id += 1
            
            # Auto-save after adding
            self.save_data()
            
            return {
                'success': True,
                'message': 'Record added successfully',
                'record': new_record
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error adding record: {str(e)}'
            }
    
    def get_all_records(self):
        """Get all records"""
        return {
            'success': True,
            'data': self.data,
            'count': len(self.data)
        }
    
    def delete_record(self, record_id: str):
        """Delete a record by ID"""
        try:
            initial_count = len(self.data)
            self.data = [record for record in self.data if record['ID'] != record_id]
            
            if len(self.data) < initial_count:
                self.save_data()
                return {
                    'success': True,
                    'message': 'Record deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Record not found'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'Error deleting record: {str(e)}'
            }
    
    def update_record(self, record_id: str, name: str, email: str, phone: str, notes: str = ""):
        """Update an existing record"""
        try:
            for record in self.data:
                if record['ID'] == record_id:
                    record['Name'] = name.strip()
                    record['Email'] = email.strip()
                    record['Phone'] = phone.strip()
                    record['Notes'] = notes.strip()
                    
                    self.save_data()
                    return {
                        'success': True,
                        'message': 'Record updated successfully',
                        'record': record
                    }
            
            return {
                'success': False,
                'message': 'Record not found'
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error updating record: {str(e)}'
            }
    
    def search_records(self, query: str):
        """Search records by name, email, or phone"""
        try:
            query = query.lower().strip()
            if not query:
                return self.get_all_records()
            
            filtered_data = []
            for record in self.data:
                if (query in record['Name'].lower() or 
                    query in record['Email'].lower() or 
                    query in record['Phone'].lower() or 
                    query in record['Notes'].lower()):
                    filtered_data.append(record)
            
            return {
                'success': True,
                'data': filtered_data,
                'count': len(filtered_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error searching records: {str(e)}',
                'data': []
            }
    
    def clear_all_data(self):
        """Clear all data (with confirmation)"""
        try:
            self.data = []
            self.next_id = 1
            self.save_data()
            
            return {
                'success': True,
                'message': 'All data cleared successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error clearing data: {str(e)}'
            }