# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-01 08:09
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bibliography', '0006_auto_20161122_0304'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='entry',
            unique_together=set([]),
        ),
    ]
