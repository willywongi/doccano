from api.models import Project, Role, RoleMapping, User
from django.core.management.base import BaseCommand, CommandError
from app.settings import ROLE_ANNOTATOR


class Command(BaseCommand):
    help = 'Non-interactively set every user as `annotator` of every project'

    def handle(self, *args, **options):
        projects = Project.objects.all()
        users = User.objects.all()
        role = Role.objects.get(name=ROLE_ANNOTATOR)
        rolemappings = {(m.user_id, m.project_id): m.role_id for m in RoleMapping.objects.all()}


        for user in users:
            for project in projects:
                if (user.id, project.id) in rolemappings:
                    continue
                try:
                    rolemapping = RoleMapping.objects.create(role_id=role.id, user_id=user.id, project_id=project.id)
                except Exception as exc:
                    self.stderr.write(self.style.ERROR('Error occurred while creating rolemapping "%s"' % exc))
                else:
                    self.stdout.write(self.style.SUCCESS('Rolemapping created successfully "%s" for %s/%s' % (rolemapping.id, user, project)))
