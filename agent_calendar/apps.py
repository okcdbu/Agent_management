from django.apps import AppConfig


class AgentCalendarConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'agent_calendar'

    def ready(self):
        import agent_calendar.signal
