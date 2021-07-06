# Generated by Django 3.1.4 on 2021-04-05 16:21

from django.db import migrations


def change_access_right_to_generic_key(apps, schema_editor):
    AccessRight  = apps.get_model('document', 'AccessRight')
    ContentType = apps.get_model('contenttypes', 'ContentType')
    user_ct = ContentType.objects.filter(
        app_label='user',
        model='user'
    ).first()
    access_rights = AccessRight.objects.all()
    for access_right in access_rights:
        access_right.holder_id = access_right.user_id
        access_right.holder_type = user_ct
        access_right.save()


def reverse_change_access_right_to_generic_key(apps, schema_editor):
    AccessRight  = apps.get_model('document', 'AccessRight')
    access_rights = AccessRight.objects.all()
    user_ct = ContentType.objects.filter(
        app_label='user',
        model='user'
    ).first()
    for access_right in access_rights:
        if access_right.holder_type != user_ct:
            # This is not a regular user. Don't try to revert
            continue
        access_right.user_id = up.holder_id
        access_right.save()


class Migration(migrations.Migration):

    dependencies = [
        ('document', '0011_auto_20210405_1820'),
        ('user', '0004_auto_20210402_2049')
    ]

    operations = [
        migrations.RunPython(
            change_access_right_to_generic_key,
            reverse_change_access_right_to_generic_key
        ),
    ]
