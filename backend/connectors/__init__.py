"""
Module des connecteurs de données externes
"""
from .base import BaseConnector
from .rest_api import RestApiConnector
from .google_sheets import GoogleSheetsConnector
from .salesforce import SalesforceConnector
from .hubspot import HubSpotConnector
from .workday import WorkdayConnector
from .bamboohr import BambooHRConnector
from .pipedrive import PipedriveConnector
from .zendesk import ZendeskConnector

__all__ = [
    'BaseConnector',
    'RestApiConnector',
    'GoogleSheetsConnector',
    'SalesforceConnector',
    'HubSpotConnector',
    'WorkdayConnector',
    'BambooHRConnector',
    'PipedriveConnector',
    'ZendeskConnector'
]
